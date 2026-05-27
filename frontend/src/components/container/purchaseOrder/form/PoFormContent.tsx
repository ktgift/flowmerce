import { zodResolver } from "@hookform/resolvers/zod";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { Alert, Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import type { PoDetail } from "@/lib/@types/po";
import type { SelectedProduct } from "@/lib/@types/product";
import {
  downloadPoPdf,
  useChangePoStatus,
  useCreatePo,
  useUpdatePo,
} from "@/lib/api/po.api";
import { COLORS } from "@/lib/constants/colors";
import { PO_CREATE_DEFAULTS } from "@/lib/constants/po";
import { ROUTES } from "@/lib/constants/routes";
import { useModal } from "@/lib/hook/useModal";
import type { PoCreateFormValues } from "@/lib/schema/po.schema";
import { poCreateSchema, poUpdateSchema } from "@/lib/schema/po.schema";
import { formatDateTime } from "@/lib/utils/format"
import { getPoExportBlockers } from "@/lib/utils/po";

import { useSetPageHeader } from "@/components/context/PageHeaderContext";
import { useSnackbar } from "@/lib/hook/useSnackbar";

import PoAttachmentSection from "./PoAttachmentSection";
import PoFormBar from "./PoFormBar";
import PoInfoSection from "./PoInfoSection";
import PoItemsSection from "./PoItemsSection";
import PoPdfPreviewContent from "./PoPdfPreviewContent";
import PoProductSearchContent from "./PoProductSearchContent";
import PoSupplierSection from "./PoSupplierSection";
import PoTermsSection from "./PoTermsSection";

interface PoFormContentProps {
  mode: "create" | "edit";
  po: PoDetail | null;
}


export function PoFormContent({ mode, po }: PoFormContentProps) {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savedPoId, setSavedPoId] = useState<number | null>(po?.id ?? null);
  const exportingRef = useRef(false);

  const [issuedAt, setIssuedAt] = useState<string | null>(() => {
    if (!po || po.status !== "issued") return null;
    const entry = [...po.history]
      .filter((h) => h.newStatus === "issued")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return entry ? formatDateTime(entry.createdAt) : null;
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const { success: showSuccess, error: showError } = useSnackbar();

  const createPo = useCreatePo();
  const updatePo = useUpdatePo(savedPoId ?? 0);
  const changeStatus = useChangePoStatus(savedPoId ?? 0);

  const today = dayjs().format("YYYY-MM-DD");

  const { control, getValues, setValue, reset } = useForm<PoCreateFormValues>({
    resolver: zodResolver(mode === "create" ? poCreateSchema : poUpdateSchema),
    defaultValues: po
      ? (po as PoCreateFormValues)
      : { ...PO_CREATE_DEFAULTS, expectedDate: today },
  });

  useEffect(() => {
    if (mode === "edit" && po) {
      reset(po as PoCreateFormValues);
    }
  }, [po, mode, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  function buildPayload(values: PoCreateFormValues) {
    const { supplierSnapshot: _snap, ...rest } = values;
    // Strip nulls to undefined — backend (Elysia) rejects null on optional fields
    return JSON.parse(JSON.stringify(rest, (_, v) => (v === null ? undefined : v)));
  }

  const onSaveDraft = useCallback(async () => {
    const values = getValues();
    setIsSaving(true);
    try {
      const payload = buildPayload(values);
      if (!savedPoId) {
        const created = await createPo.mutateAsync(
          payload as Parameters<typeof createPo.mutateAsync>[0],
        );
        setSavedPoId(created.id);
        navigate(`${ROUTES.purchaseOrders}/${created.id}/edit`, { replace: true });
      } else {
        await updatePo.mutateAsync(payload as Parameters<typeof updatePo.mutateAsync>[0]);
      }
      showSuccess("Draft saved successfully");
    } catch {
      showError("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPoId, getValues, createPo.mutateAsync, updatePo.mutateAsync, navigate]);

  const onReview = useCallback(() => {
    if (!savedPoId) {
      onSaveDraft();
      return;
    }
    openModal({
      title: "PO Preview",
      body: <PoPdfPreviewContent poId={savedPoId} />,
      width: 780,
      maxHeight: 90,
    });
  }, [savedPoId, onSaveDraft, openModal]);

  const onExportPdf = useCallback(async () => {
    if (exportingRef.current) return;
    exportingRef.current = true;
    const values = getValues();
    setIsExporting(true);
    try {
      const payload = buildPayload(values);
      let currentId = savedPoId;
      if (!currentId) {
        const created = await createPo.mutateAsync(
          payload as Parameters<typeof createPo.mutateAsync>[0],
        );
        currentId = created.id;
        setSavedPoId(created.id);
        navigate(`${ROUTES.purchaseOrders}/${created.id}/edit`, { replace: true });
      } else {
        await updatePo.mutateAsync(payload as Parameters<typeof updatePo.mutateAsync>[0]);
      }
      if (po?.status !== "issued") {
        await changeStatus.mutateAsync({ status: "issued" });
      }
      await downloadPoPdf(currentId, po?.poNumber ?? `PO-${currentId}`);
      setIssuedAt(formatDateTime(dayjs().toISOString()));
      showSuccess("PDF exported and PO issued successfully");
    } catch {
      showError("Failed to export PDF");
    } finally {
      exportingRef.current = false;
      setIsExporting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPoId, getValues, createPo.mutateAsync, updatePo.mutateAsync, changeStatus.mutateAsync, navigate, po?.status, po?.poNumber]);

  function handleAddProduct(product: SelectedProduct) {
    append({
      name: product.name,
      sku: product.sku ?? undefined,
      unit: product.unit ?? undefined,
      quantity: 1,
      exWorkPrice: product.lastCostPrice ?? 1,
      freightCost: 0,
    });
    closeModal();
  }

  function openProductSearch() {
    openModal({
      title: "Search Product",
      body: <PoProductSearchContent onSelect={handleAddProduct} />,
      width: 620,
    });
  }

  const watchedValues  = useWatch({ control }) as Partial<PoCreateFormValues>;
  const exportBlockers = getPoExportBlockers({
    ...watchedValues,
    supplierLabel: watchedValues.supplierSnapshot?.label,
  });
  const isExportReady  = exportBlockers.length === 0;

  const currentStatus = po?.status ?? "draft";
  const isIssued      = currentStatus === "issued";

  useSetPageHeader(
    {
      title:
        mode === "create"
          ? "New Purchase Order"
          : (po?.poNumber ?? "Edit Purchase Order"),
      breadcrumbs: [
        { label: "Purchase Orders", href: ROUTES.purchaseOrders },
        { label: mode === "create" ? "New PO" : (po?.poNumber ?? "Edit") },
      ],
      actions: (
        <PoFormBar
          status={currentStatus}
          issuedAt={issuedAt}
          isSaving={isSaving}
          isExporting={isExporting}
          exportBlockers={exportBlockers}
          onSaveDraft={onSaveDraft}
          onReview={onReview}
          onExportPdf={onExportPdf}
        />
      ),
    },
    [mode, po?.poNumber, isExportReady, isSaving, isExporting],
  );

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      {isIssued && issuedAt && (
        <Alert
          icon={<CheckCircleOutlineIcon />}
          severity="success"
          action={
            <Typography
              component="span"
              sx={{
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: COLORS.primary,
              }}
              onClick={() =>
                openModal({
                  title: "PO Preview",
                  body: <PoPdfPreviewContent poId={savedPoId!} />,
                  width: 780,
                  maxHeight: 90,
                })
              }
            >
              View latest file
            </Typography>
          }
          sx={{ borderRadius: 2 }}
        >
          <strong>PO issued on {issuedAt}</strong> — Changes will update the
          existing PO. Export PDF again to create a new file.
        </Alert>
      )}

      <PoInfoSection
        control={control}
        poNumber={po?.poNumber ?? null}
        issueDate={today}
      />

      <PoSupplierSection control={control} />

      <PoItemsSection
        control={control}
        setValue={setValue}
        fields={fields}
        remove={remove}
        onAddProduct={openProductSearch}
      />

      <PoTermsSection control={control} setValue={setValue} />

      <PoAttachmentSection files={attachments} onChange={setAttachments} />

      <Typography
        sx={{
          textAlign: "center",
          fontSize: "0.78rem",
          color: COLORS.subText,
          pb: 2,
        }}
      >
        Save as Draft first — Export PDF when ready to send to Supplier
      </Typography>
    </Box>
  );
}

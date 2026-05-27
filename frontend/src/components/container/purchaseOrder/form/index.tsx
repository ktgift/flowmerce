import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usePo } from "@/lib/api/po.api";
import { useConfirmDialogContext } from "@/components/context/ConfirmDialogContext";
import { PoFormContent } from "./PoFormContent";

interface PoFormPageProps {
  mode: "create" | "edit";
}

export default function PoFormPage({ mode }: PoFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const { confirm } = useConfirmDialogContext();
  const navigate = useNavigate();
  const poId = id ? Number(id) : undefined;

  const { data: po, isError, isLoading } = usePo(poId!, {
    enabled: mode === "edit" && !!poId,
  });

  useEffect(() => {
    if (mode === "edit" && !isLoading && (isError || !po)) {
      confirm({
        title: "Unable to Load Purchase Order",
        message: "The purchase order could not be loaded. Would you like to go back?",
        confirmLabel: "Go Back",
        cancelLabel: "Stay",
        confirmColor: "error",
      }).then((confirmed) => {
        if (confirmed) navigate(-1);
      });
    }
  }, [mode, isError, isLoading, po]);

  if (mode === "edit" && isLoading) return null;

  return <PoFormContent mode={mode} po={po ?? null} />;
}


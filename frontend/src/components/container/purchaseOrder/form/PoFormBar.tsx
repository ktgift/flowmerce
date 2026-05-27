import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PreviewOutlinedIcon from "@mui/icons-material/PreviewOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { PoStatus } from "@/lib/@types/po";
import { COLORS } from "@/lib/constants/colors";

interface PoFormBarProps {
  status:         PoStatus;
  issuedAt:       string | null;
  isSaving:       boolean;
  isExporting:    boolean;
  exportBlockers: string[];
  onSaveDraft:    () => void;
  onReview:       () => void;
  onExportPdf:    () => void;
}

const STATUS_LABEL: Partial<Record<PoStatus, string>> = {
  draft:  "Draft",
  issued: "Issued",
};

const STATUS_COLOR: Partial<Record<PoStatus, string>> = {
  draft:  COLORS.grayMedium,
  issued: COLORS.success,
};

export default function PoFormBar({
  status,
  issuedAt,
  isSaving,
  isExporting,
  exportBlockers,
  onSaveDraft,
  onReview,
  onExportPdf,
}: PoFormBarProps) {
  const isIssued   = status === "issued";
  const canExport  = exportBlockers.length === 0;

  const tooltipTitle = canExport ? "" : (
    <Box sx={{ py: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
        Cannot export yet:
      </Typography>
      {exportBlockers.map((b) => (
        <Typography key={b} variant="caption" sx={{ display: "block" }}>
          • {b}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Chip
        size="small"
        label={
          isIssued && issuedAt
            ? `● ${STATUS_LABEL[status] ?? status} · ${issuedAt}`
            : `● ${STATUS_LABEL[status] ?? status}`
        }
        sx={{
          bgcolor: COLORS.primarylight,
          color:   STATUS_COLOR[status] ?? COLORS.grayMedium,
          fontWeight: 600,
          fontSize:   "0.75rem",
          border: "none",
          px: 1,
          py: 2,
        }}
      />

      <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={isSaving ? <CircularProgress size={14} /> : <SaveOutlinedIcon />}
          disabled={isSaving || isExporting}
          onClick={onSaveDraft}
          sx={{ fontWeight: 600, fontSize: "0.82rem" }}
        >
          Save Draft
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<PreviewOutlinedIcon />}
          disabled={isSaving || isExporting}
          onClick={onReview}
          sx={{ fontWeight: 600, fontSize: "0.82rem" }}
        >
          Review
        </Button>

        <Tooltip title={tooltipTitle} arrow placement="bottom-end">
          <span>
            <Button
              variant="contained"
              size="small"
              startIcon={
                isExporting
                  ? <CircularProgress size={14} sx={{ color: "white" }} />
                  : <PictureAsPdfOutlinedIcon />
              }
              disabled={!canExport || isSaving || isExporting}
              onClick={onExportPdf}
              sx={{ fontWeight: 600, fontSize: "0.82rem" }}
            >
              {isIssued ? "Export PDF New" : "Export PDF"}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

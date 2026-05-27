import { useRef } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined"
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined"
import CloseIcon from "@mui/icons-material/Close"

import { COLORS } from "@/lib/constants/colors"

interface FileDropZoneProps {
  files:     File[]
  onChange:  (files: File[]) => void
  maxFiles?: number
  accept?:   string[]
  hint?:     string
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const DEFAULT_ACCEPT = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
]

export default function FileDropZone({
  files,
  onChange,
  maxFiles = 10,
  accept   = DEFAULT_ACCEPT,
  hint     = "PDF, Excel, Images",
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    onChange([...files, ...Array.from(incoming)].slice(0, maxFiles))
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <Box>
      {/* Drop zone */}
      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        sx={{
          border:         "1.5px dashed",
          borderColor:    COLORS.border,
          borderRadius:   2,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          py:             4,
          gap:            0.75,
          cursor:         "pointer",
          bgcolor:        COLORS.backgroundDefault,
          transition:     "border-color 0.15s",
          "&:hover":      { borderColor: COLORS.primary },
        }}
      >
        <Box
          sx={{
            width:          48,
            height:         48,
            bgcolor:        COLORS.primarylight,
            borderRadius:   "50%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <UploadFileOutlinedIcon sx={{ color: COLORS.primary, fontSize: 24 }} />
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          Drop files here or click to select
        </Typography>
        <Typography sx={{ fontSize: "0.75rem", color: COLORS.subText }}>
          {hint} — up to {maxFiles} files
        </Typography>
      </Box>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept.join(",")}
        style={{ display: "none" }}
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* File list */}
      {files.length > 0 && (
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {files.map((file, idx) => (
            <Box
              key={`${file.name}-${idx}`}
              sx={{
                display:     "flex",
                alignItems:  "center",
                gap:         1,
                px:          1.5,
                py:          0.75,
                border:      "1px solid",
                borderColor: COLORS.border,
                borderRadius: 1.5,
                bgcolor:     "background.paper",
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: COLORS.neutral, flexShrink: 0 }} />
              <Typography
                sx={{
                  flexGrow:      1,
                  fontSize:      "0.82rem",
                  overflow:      "hidden",
                  textOverflow:  "ellipsis",
                  whiteSpace:    "nowrap",
                }}
              >
                {file.name}
              </Typography>
              <Typography sx={{ fontSize: "0.72rem", color: COLORS.subText, flexShrink: 0 }}>
                {formatSize(file.size)}
              </Typography>
              <IconButton size="small" onClick={() => removeFile(idx)} sx={{ flexShrink: 0 }}>
                <CloseIcon sx={{ fontSize: 15, color: COLORS.neutral }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

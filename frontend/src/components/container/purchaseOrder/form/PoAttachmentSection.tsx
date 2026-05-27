import FileDropZone from "@/components/common/FileDropZone"
import { SectionCard, SectionTitle } from "./PoInfoSection"

interface PoAttachmentSectionProps {
  files:    File[]
  onChange: (files: File[]) => void
}

export default function PoAttachmentSection({ files, onChange }: PoAttachmentSectionProps) {
  return (
    <SectionCard>
      <SectionTitle>Attachments</SectionTitle>
      <FileDropZone files={files} onChange={onChange} />
    </SectionCard>
  )
}

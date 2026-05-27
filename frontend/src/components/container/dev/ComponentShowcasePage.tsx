import { useState } from "react"
import { useForm } from "react-hook-form"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"

import PageHeader from "@/components/common/PageHeader"
import StatusBadge from "@/components/common/StatusBadge"
import DataTable, { type TableColumn } from "@/components/common/DataTable"
import FormTextField from "@/components/common/FormTextField"
import FormSelect from "@/components/common/FormSelect"
import FormNumberField from "@/components/common/FormNumberField"
import FormDatePicker from "@/components/common/FormDatePicker"
import Autocomplate from "@/components/common/Autocomplate"
import ConfirmDialog from "@/components/common/ConfirmDialog"
import { ModalContainer } from "@/components/common/Modal"
import { useModal } from "@/lib/hook/useModal"
import { useConfirmDialog } from "@/lib/hook/useConfirmDialog"

// ─────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography
        variant="overline"
        sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.1em", display: "block", mb: 2 }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  )
}

// ─────────────────────────────────────────────────────────
// Mock data for DataTable
// ─────────────────────────────────────────────────────────
interface MockRow {
  id: number
  name: string
  status: string
  amount: number
  date: string
}

const MOCK_ROWS: MockRow[] = [
  { id: 1, name: "Acme Corp", status: "active", amount: 12500, date: "2026-05-01" },
  { id: 2, name: "Globex Ltd", status: "pending", amount: 8200, date: "2026-05-03" },
  { id: 3, name: "Initech Inc", status: "inactive", amount: 4100, date: "2026-05-10" },
  { id: 4, name: "Umbrella Co", status: "active", amount: 31000, date: "2026-05-14" },
  { id: 5, name: "Stark Industries", status: "pending", amount: 99000, date: "2026-05-20" },
]

const STATUS_COLOR_MAP: Record<string, { bg: string; color: string }> = {
  active:   { bg: "#e8f5e9", color: "#2e7d32" },
  pending:  { bg: "#fff8e1", color: "#f57f17" },
  inactive: { bg: "#fce4ec", color: "#b71c1c" },
}

const TABLE_COLUMNS: TableColumn<MockRow>[] = [
  { key: "id", label: "ID", width: 60 },
  { key: "name", label: "Company" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge
        status={row.status}
        backgroundColor={STATUS_COLOR_MAP[row.status]?.bg}
        color={STATUS_COLOR_MAP[row.status]?.color}
        labelMap={{ active: "Active", pending: "Pending", inactive: "Inactive" }}
      />
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (row) => (
      <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {row.amount.toLocaleString("th-TH", { style: "currency", currency: "THB" })}
      </Typography>
    ),
  },
  { key: "date", label: "Date" },
]

// ─────────────────────────────────────────────────────────
// Form shape
// ─────────────────────────────────────────────────────────
interface ShowcaseForm {
  textField: string
  email: string
  multiline: string
  select: string
  number: number | ""
  date: string
  autocomplete: string | null
}

const CATEGORY_OPTIONS = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing",    label: "Clothing" },
  { value: "food",        label: "Food & Beverage" },
  { value: "tools",       label: "Tools & Equipment" },
]

const SUPPLIER_OPTIONS = [
  { value: "s1", label: "Acme Corp" },
  { value: "s2", label: "Globex Ltd" },
  { value: "s3", label: "Initech Inc" },
  { value: "s4", label: "Umbrella Co" },
]

// ─────────────────────────────────────────────────────────
// StatusBadge section
// ─────────────────────────────────────────────────────────
function StatusBadgeSection() {
  return (
    <Section title="StatusBadge">
      <Stack direction="row" flexWrap="wrap" gap={1.5}>
        <StatusBadge status="active"   backgroundColor="#e8f5e9" color="#2e7d32" labelMap={{ active: "Active" }} />
        <StatusBadge status="pending"  backgroundColor="#fff8e1" color="#f57f17" labelMap={{ pending: "Pending" }} />
        <StatusBadge status="inactive" backgroundColor="#fce4ec" color="#b71c1c" labelMap={{ inactive: "Inactive" }} />
        <StatusBadge status="shipped"  backgroundColor="#e3f2fd" color="#1565c0" labelMap={{ shipped: "Shipped" }} />
        <StatusBadge status="draft"    backgroundColor="#f3e5f5" color="#6a1b9a" labelMap={{ draft: "Draft" }} />
        <StatusBadge status="cancelled" backgroundColor="#eeeeee" color="#616161" labelMap={{ cancelled: "Cancelled" }} />
        <Divider sx={{ width: "100%", my: 1 }} />
        <Typography variant="caption" color="text.secondary" sx={{ width: "100%" }}>
          No labelMap (raw value shown):
        </Typography>
        <StatusBadge status="RAW_STATUS" />
        <StatusBadge status="ANOTHER_STATUS" backgroundColor="#e0f7fa" color="#00695c" />
      </Stack>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────
// PageHeader section
// ─────────────────────────────────────────────────────────
function PageHeaderSection() {
  return (
    <Section title="PageHeader">
      <Stack spacing={2}>
        <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: "block" }}>
            Title only
          </Typography>
          <PageHeader title="Purchase Orders" />
        </Box>
        <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: "block" }}>
            With breadcrumbs
          </Typography>
          <PageHeader
            title="PO-2026-001"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Purchase Orders", href: "/purchase-orders" },
              { label: "PO-2026-001" },
            ]}
          />
        </Box>
        <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1, display: "block" }}>
            With actions
          </Typography>
          <PageHeader
            title="Products"
            breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
            actions={
              <>
                <Button variant="outlined" size="small" startIcon={<EditIcon />}>Edit</Button>
                <Button variant="contained" size="small" startIcon={<AddIcon />}>New</Button>
              </>
            }
          />
        </Box>
      </Stack>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────
// Form components section
// ─────────────────────────────────────────────────────────
function FormComponentsSection() {
  const { control, handleSubmit, watch } = useForm<ShowcaseForm>({
    defaultValues: {
      textField: "",
      email: "",
      multiline: "",
      select: "",
      number: "",
      date: "",
      autocomplete: null,
    },
  })

  const values = watch()

  return (
    <Section title="Form Components (react-hook-form)">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormTextField control={control} name="textField" label="Text Field" placeholder="Enter text..." />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormTextField control={control} name="email" label="Email" type="email" placeholder="user@example.com" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormSelect control={control} name="select" label="Category" options={CATEGORY_OPTIONS} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormNumberField control={control} name="number" label="Quantity" min={0} max={9999} step={1} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormDatePicker control={control} name="date" label="Delivery Date" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Autocomplate control={control} name="autocomplete" label="Supplier" options={SUPPLIER_OPTIONS} placeholder="Search supplier..." />
        </Grid>
        <Grid item xs={12}>
          <FormTextField control={control} name="multiline" label="Notes" multiline rows={3} placeholder="Optional notes..." />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
          Live values: {JSON.stringify(values, null, 2)}
        </Typography>
      </Box>

      <Stack direction="row" gap={1} mt={2}>
        <Button variant="contained" size="small" onClick={handleSubmit((d) => alert(JSON.stringify(d, null, 2)))}>
          Submit (see values)
        </Button>
      </Stack>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────
// DataTable section
// ─────────────────────────────────────────────────────────
function DataTableSection() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const simulateLoad = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <Section title="DataTable">
      <Stack direction="row" gap={1} mb={2}>
        <Button size="small" variant="outlined" onClick={simulateLoad}>
          Simulate Loading
        </Button>
      </Stack>
      <DataTable
        rows={MOCK_ROWS}
        columns={TABLE_COLUMNS}
        total={MOCK_ROWS.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        loading={loading}
        onRowClick={(row) => alert(`Clicked: ${row.name}`)}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.disabled">
          Empty state (no rows):
        </Typography>
        <Box sx={{ mt: 1 }}>
          <DataTable
            rows={[]}
            columns={TABLE_COLUMNS}
            total={0}
            page={0}
            pageSize={10}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}
          />
        </Box>
      </Box>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────
// ConfirmDialog section
// ─────────────────────────────────────────────────────────
function ConfirmDialogSection() {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState<"primary" | "error" | "warning" | "success">("primary")
  const [result, setResult] = useState<string | null>(null)
  const { confirm } = useConfirmDialog()

  const openWith = (c: typeof color) => {
    setColor(c)
    setOpen(true)
    setResult(null)
  }

  const handlePromise = async () => {
    const ok = await confirm({
      title: "Delete Record",
      message: "Are you sure you want to delete this record? This action cannot be undone.",
      confirmLabel: "Delete",
      confirmColor: "error",
    })
    setResult(ok ? "Confirmed via hook" : "Cancelled via hook")
  }

  return (
    <Section title="ConfirmDialog">
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        <Button size="small" variant="contained" color="primary" onClick={() => openWith("primary")}>
          Primary
        </Button>
        <Button size="small" variant="contained" color="error" onClick={() => openWith("error")}>
          Danger
        </Button>
        <Button size="small" variant="contained" color="warning" onClick={() => openWith("warning")}>
          Warning
        </Button>
        <Button size="small" variant="contained" color="success" onClick={() => openWith("success")}>
          Success
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button size="small" variant="outlined" startIcon={<DeleteIcon />} onClick={handlePromise}>
          useConfirmDialog hook (Promise)
        </Button>
      </Stack>

      {result && (
        <Chip label={result} color={result.includes("Confirmed") ? "success" : "default"} size="small" sx={{ mb: 1 }} />
      )}

      <ConfirmDialog
        open={open}
        title="Confirm Action"
        message={`This will perform a ${color} action. Are you sure you want to continue?`}
        confirmColor={color}
        confirmLabel="Yes, continue"
        onConfirm={() => { setOpen(false); setResult("Confirmed") }}
        onCancel={() => { setOpen(false); setResult("Cancelled") }}
      />
    </Section>
  )
}

// ─────────────────────────────────────────────────────────
// Modal section
// ─────────────────────────────────────────────────────────
function ModalSection() {
  const { openModal, closeModal } = useModal()

  const openBasic = () =>
    openModal({
      title: "Basic Modal",
      body: (
        <Stack spacing={2}>
          <Typography>This is modal body content. It can contain any React node.</Typography>
          <Typography variant="body2" color="text.secondary">
            Scroll the body if content overflows. Click backdrop or × to close.
          </Typography>
          <Button variant="contained" size="small" onClick={closeModal}>Close from inside</Button>
        </Stack>
      ),
    })

  const openWithDivider = () =>
    openModal({
      title: "Modal with Divider",
      titleLine: true,
      width: 480,
      body: (
        <Stack spacing={2}>
          <Typography>Content below the divider line.</Typography>
          <Typography variant="body2" color="text.secondary">Width is 480px, title has a divider.</Typography>
        </Stack>
      ),
    })

  const openNoBdClose = () =>
    openModal({
      title: "No Backdrop Close",
      closeOnBackdrop: false,
      body: (
        <Stack spacing={2}>
          <Typography>Clicking outside does NOT close this modal.</Typography>
          <Typography variant="body2" color="text.secondary">Use the × button to close.</Typography>
        </Stack>
      ),
    })

  const openWithForm = () =>
    openModal({
      title: "Edit Supplier",
      titleLine: true,
      width: 520,
      body: <ModalFormContent onClose={closeModal} />,
    })

  return (
    <Section title="Modal (ModalContext + useModal hook)">
      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Button size="small" variant="outlined" onClick={openBasic}>Basic Modal</Button>
        <Button size="small" variant="outlined" onClick={openWithDivider}>With Divider</Button>
        <Button size="small" variant="outlined" onClick={openNoBdClose}>No Backdrop Close</Button>
        <Button size="small" variant="contained" onClick={openWithForm}>With Form Content</Button>
      </Stack>
    </Section>
  )
}

interface ModalFormValues {
  supplierName: string
  category: string
  amount: number | ""
}

function ModalFormContent({ onClose }: { onClose: () => void }) {
  const { control, handleSubmit } = useForm<ModalFormValues>({
    defaultValues: { supplierName: "Acme Corp", category: "electronics", amount: 5000 },
  })

  return (
    <Stack spacing={2} component="form" onSubmit={handleSubmit((d) => { alert(JSON.stringify(d)); onClose() })}>
      <FormTextField control={control} name="supplierName" label="Supplier Name" />
      <FormSelect control={control} name="category" label="Category" options={CATEGORY_OPTIONS} />
      <FormNumberField control={control} name="amount" label="Amount" min={0} />
      <Stack direction="row" justifyContent="flex-end" gap={1} pt={1}>
        <Button variant="outlined" size="small" onClick={onClose}>Cancel</Button>
        <Button variant="contained" size="small" type="submit">Save</Button>
      </Stack>
    </Stack>
  )
}

// ─────────────────────────────────────────────────────────
// Standalone ModalContainer demo
// ─────────────────────────────────────────────────────────
function StandaloneModalSection() {
  const [open, setOpen] = useState(false)

  return (
    <Section title="ModalContainer (standalone, without context)">
      <Button size="small" variant="outlined" onClick={() => setOpen(true)}>
        Open Standalone Modal
      </Button>
      <ModalContainer
        open={open}
        title="Standalone Modal"
        titleLine
        width={400}
        body={
          <Stack spacing={2}>
            <Typography>This uses ModalContainer directly without the context/hook.</Typography>
            <Button variant="contained" size="small" onClick={() => setOpen(false)}>Close</Button>
          </Stack>
        }
        onClose={() => setOpen(false)}
      />
    </Section>
  )
}

// ─────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────
export default function ComponentShowcasePage() {
  return (
    <Box sx={{ height: "100%", overflowY: "auto" }}>
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1100, mx: "auto" }}>
      <PageHeader
        title="Component Showcase"
        breadcrumbs={[{ label: "Dev", href: "/" }, { label: "Showcase" }]}
        actions={
          <Chip label="DEV ONLY" size="small" color="warning" variant="outlined" />
        }
      />

      <Stack spacing={3}>
        <StatusBadgeSection />
        <PageHeaderSection />
        <FormComponentsSection />
        <DataTableSection />
        <ConfirmDialogSection />
        <ModalSection />
        <StandaloneModalSection />
      </Stack>
    </Box>
    </Box>
  )
}

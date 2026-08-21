"use client"

import React, { useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { formatIDR, formatDateTime } from "@/lib/formatters"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, CheckCircle2 } from "lucide-react"

interface ReceiptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any
}

export function ReceiptModal({ open, onOpenChange, transaction }: ReceiptModalProps) {
  const { workspace } = useAuth()
  const printRef = useRef<HTMLDivElement>(null)

  if (!transaction) return null

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      window.print()
      return
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk - ${transaction.invoice_number}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 300px;
              margin: 0 auto;
              padding: 10px;
              font-size: 12px;
              color: #000;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
            .item-row { margin-bottom: 4px; }
            @media print {
              body { width: 100%; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const businessName = workspace?.name || "theKasir Mart"
  const businessAddress = workspace?.address || "Jl. Sudirman No. 88, Jakarta"
  const businessPhone = workspace?.phone || "08123456789"
  const receiptHeader = workspace?.receipt_header || ""
  const receiptFooter =
    workspace?.receipt_footer || "Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <DialogTitle className="text-base font-bold text-foreground">
              Transaksi Berhasil Diproses
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Printable Paper Preview */}
        <div
          ref={printRef}
          className="bg-white text-black p-5 rounded-lg border font-mono text-xs shadow-inner space-y-3 leading-relaxed"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="text-base font-black uppercase tracking-wider">{businessName}</div>
            <div className="text-[11px] text-gray-700">{businessAddress}</div>
            {businessPhone && <div className="text-[11px] text-gray-700">Telp: {businessPhone}</div>}
            {receiptHeader && <div className="text-[10px] text-gray-600 italic">{receiptHeader}</div>}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Meta */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>No. Struk:</span>
              <span className="font-bold">{transaction.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{formatDateTime(transaction.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{transaction.user?.name || "Kasir"}</span>
            </div>
            {transaction.customer && (
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{transaction.customer.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Metode Bayar:</span>
              <span className="font-bold uppercase">{transaction.payment_method}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Items */}
          <div className="space-y-2">
            {transaction.items?.map((it: any, idx: number) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-semibold">{it.product_name || it.product?.name}</div>
                <div className="flex justify-between text-gray-700 text-[11px]">
                  <span>
                    {it.qty} x {formatIDR(it.price)}
                  </span>
                  <span>{formatIDR(it.subtotal)}</span>
                </div>
                {it.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600 text-[10px]">
                    <span>Diskon Item</span>
                    <span>-{formatIDR(it.discount_amount)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Totals */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatIDR(transaction.subtotal)}</span>
            </div>
            {transaction.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Diskon:</span>
                <span>-{formatIDR(transaction.discount_amount)}</span>
              </div>
            )}
            {transaction.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>Pajak (PPN):</span>
                <span>+{formatIDR(transaction.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
              <span>TOTAL:</span>
              <span>{formatIDR(transaction.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar:</span>
              <span>{formatIDR(transaction.paid_amount)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembalian:</span>
              <span>{formatIDR(transaction.change_amount)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Footer */}
          <div className="text-center text-[10px] text-gray-600 whitespace-pre-line">
            {receiptFooter}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Cetak Struk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

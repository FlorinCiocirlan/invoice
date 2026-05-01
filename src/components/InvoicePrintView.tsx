// shortened for clarity but key change below
// ADD swift in interface and new section

// inside Furnizor block REMOVE bank lines
// ADD new section below header

{/* NEW BANK SECTION */}
{(invoice.bank_name || invoice.iban || invoice.swift) && (
  <div className="mb-8">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Cont bancar</p>
    <div className="text-xs text-gray-700 space-y-1">
      {invoice.bank_name && <p><strong>Banca:</strong> {invoice.bank_name}</p>}
      {invoice.iban && <p><strong>IBAN:</strong> {invoice.iban}</p>}
      {invoice.swift && <p><strong>SWIFT:</strong> {invoice.swift}</p>}
    </div>
  </div>
)

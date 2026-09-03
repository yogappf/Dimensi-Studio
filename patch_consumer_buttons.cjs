const fs = require('fs');
let content = fs.readFileSync('src/components/ConsumerDashboard.tsx', 'utf8');

const reminderButtonCode = `
              {(detailOrder.status === 'Menunggu Konfirmasi' || detailOrder.status === 'Terkonfirmasi & Terjadwal') && (
                <button
                  type="button"
                  onClick={() => {
                    setReminderOrder(detailOrder);
                    setIsReminderModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#b08d28] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  id={\`btn-wa-reminder-\${detailOrder.id}\`}
                  title="Kirim pesan pengingat ke WhatsApp klien"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Kirim Pengingat</span>
                </button>
              )}
`;

content = content.replace(
  /<div className="mt-6 pt-4 border-t border-white\/10 flex flex-wrap gap-3 no-print">/,
  '<div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3 no-print">' + reminderButtonCode
);

fs.writeFileSync('src/components/ConsumerDashboard.tsx', content);

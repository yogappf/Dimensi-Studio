const fs = require('fs');
let content = fs.readFileSync('src/components/ConsumerDashboard.tsx', 'utf8');

const modalCode = `
      {/* Modal: Reminder Message */}
      {isReminderModalOpen && reminderOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37]/60 p-6 shadow-2xl text-[#E0E0E0]">
            <button
              onClick={() => {
                setIsReminderModalOpen(false);
                setIsCopiedReminder(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Kirim Pengingat WhatsApp
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  ID: {reminderOrder.id} • {reminderOrder.clientName}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                  Template Pesan Otomatis
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    className="w-full h-48 p-3 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none resize-none"
                    value={generateClientReminderMessage(reminderOrder)}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateClientReminderMessage(reminderOrder));
                      setIsCopiedReminder(true);
                      setTimeout(() => setIsCopiedReminder(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-[#1f1f1f] border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-colors"
                    title="Salin Teks"
                  >
                    {isCopiedReminder ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReminderModalOpen(false);
                    setIsCopiedReminder(false);
                  }}
                  className="flex-1 py-3 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <a
                  href={generateClientReminderWhatsAppLink(reminderOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-[#25D366] hover:bg-emerald-400 text-black border border-transparent text-xs uppercase tracking-wider font-bold text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  onClick={() => setIsReminderModalOpen(false)}
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  Kirim ke WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

`;

content = content.replace(
  /\{\/\* Modal: Add Manual Client \/ Booking \*\/\}/,
  modalCode + '      {/* Modal: Add Manual Client / Booking */}'
);

fs.writeFileSync('src/components/ConsumerDashboard.tsx', content);

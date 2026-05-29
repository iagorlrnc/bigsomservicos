export default function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-50 flex items-center justify-center p-5 animate-fade-in"
    >
      {children}
    </div>
  );
}

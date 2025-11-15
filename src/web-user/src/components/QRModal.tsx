// // src/components/QRModal.tsx
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { QRCodeSVG } from "qrcode.react";

// interface QRModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   qrValue: string;
// }

// export default function QRModal({ open, onOpenChange, qrValue }: QRModalProps) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md bg-white">
//         <DialogHeader>
//           <DialogTitle className="text-center text-maroon-800 text-2xl font-bold">
//             Registration Successful!
//           </DialogTitle>
//         </DialogHeader>
//         <div className="flex flex-col items-center py-8 space-y-6">
//           <p className="text-gray-800 text-center font-medium">
//             Show this QR code at the event entrance
//           </p>
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-200">
//             <QRCodeSVG value={qrValue} size={130} level="H" />
//           </div>
//           <div className="text-center space-y-1">
//             <p className="text-sm font-semibold text-maroon-700">
//               Valid for entry on event day
//             </p>
//             <p className="text-xs text-gray-600">
//               Screenshot or save this QR code
//             </p>
//           </div>
//           <button
//             onClick={() => onOpenChange(false)}
//             className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition shadow-md"
//           >
//             Close
//           </button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
// src/components/QRModal.tsx

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { QRCodeSVG } from "qrcode.react";

// interface QRModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   qrValue: string;
//   isNewRegistration?: boolean; // <-- new prop
// }

// export default function QRModal({
//   open,
//   onOpenChange,
//   qrValue,
//   isNewRegistration = false,
// }: QRModalProps) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md bg-white">
//         <DialogHeader>
//           <DialogTitle className="text-center text-maroon-800 text-2xl font-bold">
//             {isNewRegistration ? "Registration Successful!" : "Your QR Code"}
//           </DialogTitle>
//         </DialogHeader>
//         <div className="flex flex-col items-center py-8 space-y-6">
//           <p className="text-gray-800 text-center font-medium">
//             {isNewRegistration
//               ? "Show this QR code at the event entrance"
//               : "This QR code is valid for event entry"}
//           </p>
//           <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-200">
//             <QRCodeSVG value={qrValue} size={130} level="H" />
//           </div>
//           <div className="text-center space-y-1">
//             <p className="text-sm font-semibold text-maroon-700">
//               Valid for entry on event day
//             </p>
//             <p className="text-xs text-gray-600">
//               Screenshot or save this QR code
//             </p>
//           </div>
//           <button
//             onClick={() => onOpenChange(false)}
//             className="mt-4 w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition shadow-md"
//           >
//             Close
//           </button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface QRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrValue: string;
  isNewRegistration?: boolean; // <-- new prop
}

export default function QRModal({
  open,
  onOpenChange,
  qrValue,
  isNewRegistration = false,
}: QRModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-maroon-800 text-2xl font-bold">
            {isNewRegistration ? "Registration Successful!" : "Your QR Code"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-8 space-y-6">
          <p className="text-gray-800 text-center font-medium">
            {isNewRegistration
              ? "Show this QR code at the event entrance"
              : "This QR code is valid for event entry"}
          </p>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-200">
            <QRCodeSVG value={qrValue} size={130} level="H" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-maroon-700">
              Valid for entry on event day
            </p>
            <p className="text-xs text-gray-600">
              Screenshot or save this QR code
            </p>
          </div>

          {/* Modern, elegant McMaster maroon button */}
          <button
            onClick={() => onOpenChange(false)}
            className="mt-4 w-full bg-[#8C1C13] hover:bg-[#6F1510] text-white font-semibold py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

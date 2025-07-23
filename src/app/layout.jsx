import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export const metadata = {
  title: "Hamiket task",
  Description: "ساختار درختی با MUI",
};
export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ margin: 0 }}>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </body>
    </html>
  );
}

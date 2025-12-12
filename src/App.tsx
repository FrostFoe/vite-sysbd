import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { MessageProvider } from "./context/messages/MessageContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <MessageProvider>
          <AppRoutes />
        </MessageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

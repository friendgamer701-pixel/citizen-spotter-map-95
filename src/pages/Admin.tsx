import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <Button onClick={() => navigate("/")}>Go to Home</Button>
    </div>
  );
};

export default Admin;

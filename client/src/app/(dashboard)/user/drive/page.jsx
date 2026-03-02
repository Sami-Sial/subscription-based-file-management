import StorageStats from "./DriveStats";
import FileManager from "./FileManager";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <StorageStats />
      <FileManager />
    </div>
  );
}

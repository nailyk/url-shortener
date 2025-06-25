type TabsProps = {
  currentTab: "create" | "list";
  onChange: (tab: "create" | "list") => void;
};

export default function Tabs({ currentTab, onChange }: TabsProps) {
  return (
    <div className="app-tabs">
      {["create", "list"].map((tab) => (
        <button
          key={tab}
          className={`app-tab ${currentTab === tab ? "active" : ""}`}
          onClick={() => onChange(tab as "create" | "list")}
        >
          {tab === "create" ? "Shorten URL" : "My URLs"}
        </button>
      ))}
    </div>
  );
}

import { FileText, Image, Music } from "lucide-react";

const activities = [
  {
    icon: FileText,
    title: "Script - Improve this tone",
    subtitle: "Editado",
    time: "4h",
  },
  {
    icon: Image,
    title: "Thumbnail - Split-frame YouTube",
    subtitle: "Imagen exportada",
    time: "5h",
  },
  {
    icon: Music,
    title: "Música de ambientación",
    subtitle: "Archivo generado",
    time: "8h",
  },
];

export function ActivityPanel() {
  return (
    <aside className="flex flex-1 flex-col rounded-[14px] border border-white/[0.075] bg-[#151516] px-[26px] pb-[22px] pt-[24px]">
      <h2 className="mb-[26px] text-[16px] font-semibold text-[#F5F2F4]">
        Actividad reciente
      </h2>

      <div className="space-y-[26px]">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.title} className="grid grid-cols-[28px_minmax(0,1fr)_28px] items-start gap-[14px]">
              <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center text-[#C2C6D0]">
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.45} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium leading-[1.25] text-[#F1EEF1]">
                  {activity.title}
                </p>
                <p className="mt-[5px] text-[13px] leading-none text-[#858A98]">{activity.subtitle}</p>
              </div>
              <span className="pt-[3px] text-right text-[13px] leading-none text-[#858A98]">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export const RecentActivity = ActivityPanel;

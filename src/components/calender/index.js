import React, { useEffect, useMemo, useState } from "react";
import "../../assets/css/calendar.css";

const WEEKS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"];
const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

// Pazar(0)→Pazartesi(0) kaydırma
function shiftToMonday(dow) {
  return (dow + 6) % 7;
}

//  Date veya string'i "YYYY-MM-DD" stringine çevir
function toYmdString(d) {
  if (!d) return "";
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) return d.toISOString().split("T")[0];
  return "";
}

//  Geçmiş gün mü (bugünden küçükse true)
function isBeforeToday(date) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d.getTime() < today.getTime();
}

export default function CustomCalendarSection({
  value, // Date | null -> seçili gün
  onChange, // (Date) => void
  defaultActiveStartDate, // ilk gösterilecek ay
  disabledDates = [], //  tam dolu günler (YYYY-MM-DD veya Date[])
}) {
  // disabled günleri Set'e çevir
  const disabledSet = useMemo(
    () => new Set(disabledDates.map((d) => toYmdString(d))),
    [disabledDates]
  );

  // Görüntülenen ay/yıl
  const initial = defaultActiveStartDate || value || new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  // Dışarıdan gelen value farklı aydaysa o aya geç
  useEffect(() => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      if (value.getFullYear() !== viewYear || value.getMonth() !== viewMonth) {
        setViewYear(value.getFullYear());
        setViewMonth(value.getMonth());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // 6x7 ızgara (42 hücre)
  const grid = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startIndex = shiftToMonday(firstOfMonth.getDay());
    const dim = daysInMonth(viewYear, viewMonth);

    const cells = Array(42)
      .fill(null)
      .map((_, idx) => {
        const dayNum = idx - startIndex + 1;
        if (dayNum < 1 || dayNum > dim) return null; 
        return new Date(viewYear, viewMonth, dayNum);
      });
    return cells;
  }, [viewYear, viewMonth]);

 
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const gotoPrevMonth = () => {
    //  Geçmiş aylara tamamen gitmeyi engelle 
    const firstOfCurrentView = new Date(viewYear, viewMonth, 1);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (firstOfCurrentView.getTime() <= firstOfThisMonth.getTime()) {
      return;
    }

    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const gotoNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const handlePick = (d) => {
    if (!d) return;
    //  Geçmiş günlere tıklamayı tamamen engelle
    if (isBeforeToday(d)) return;

    const key = toYmdString(d);
    if (disabledSet.has(key)) return; //  tamamen dolu gün, seçme
    onChange?.(d);
  };

  // 42 hücreyi 6 satıra böl
  const rows = [];
  for (let r = 0; r < 6; r++) {
    const start = r * 7;
    const slice = grid.slice(start, start + 7);
    rows.push(
      <div className="fc-row" key={`row-${r}`}>
        {slice.map((d, i) => {
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, value);
          const isPast = d && isBeforeToday(d);
          const isDisabled =
            d && (disabledSet.has(toYmdString(d)) || isPast);

          const cellClass =
            (isToday ? "fc-today " : "") +
            (isSelected ? "fc-selected " : "") +
            (isDisabled ? "fc-disabled-day " : "");

          return (
            <div
              key={`cell-${r}-${i}`}
              className={cellClass.trim()}
              onClick={() => handlePick(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && d) handlePick(d);
              }}
            >
              {d ? <span className="fc-date">{d.getDate()}</span> : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section>
      <div className="main">
        <div className="custom-calendar-wrap">
          <div className="custom-inner">
            <div className="custom-header clearfix">
              <nav>
                <span
                  className="custom-prev"
                  onClick={gotoPrevMonth}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && gotoPrevMonth()
                  }
                />
                <span
                  className="custom-next"
                  onClick={gotoNextMonth}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && gotoNextMonth()
                  }
                />
              </nav>
              <h2 className="custom-month">{MONTHS[viewMonth]}</h2>
              <h3 className="custom-year">{viewYear}</h3>
            </div>

            <div className="fc-calendar-container">
              <div className="fc-calendar">
                {/* Hafta başlıkları */}
                <div className="fc-head">
                  {WEEKS.map((w, i) => (
                    <div key={i}>{w}</div>
                  ))}
                </div>
                {/* Günler */}
                <div className="fc-body">{rows}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

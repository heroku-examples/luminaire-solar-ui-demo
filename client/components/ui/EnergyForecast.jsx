export function EnergyForecast({ forecast, className }) {
  if (!forecast) return;
  const dayOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return (
    <div className={className}>
      <div className="grid grid-flow-col grid-cols-2 gap-4">
        <div className="col-span-1 border rounded-lg border-[#e5e7eb] p-4"></div>
        <div className="col-span-1 border rounded-lg border-[#e5e7eb] p-4">
          <p className="uppercase text-xs text-[#596981] font-bold">
            7 day solar production forecast
          </p>
          <div className="grid grid-flow-col pt-4 place-content-start overflow-x-auto">
            {forecast.map((day) => {
              const date = new Date(day.date);
              const dayOfWeekNumber = date.getDay();

              // calculate the height of the progress bar
              const cappedIrradiation = Math.min(day.irradiation, 6); // cap irradiation value for calculating bar percentage
              const efficiencyPercentage = cappedIrradiation / 6;
              const barHeight = 2; // height of the full bar in rem
              const fillHeight = Math.max(
                barHeight * efficiencyPercentage,
                0.2
              ); // height of the filled portion in rem; prevent empty bar
              let color;
              if (cappedIrradiation >= 4) {
                color = '#03B665';
              } else if (cappedIrradiation >= 2) {
                color = '#FA9F47';
              } else {
                color = '#D64141';
              }
              return (
                <div
                  key={`forecast-${day.date}`}
                  className="flex justify-center border-r border-[#e5e7eb] px-5 last:border-none"
                >
                  <div style={{ width: `${barHeight}rem` }}>
                    <div
                      className={`bg-[#F7F8FB] relative rounded-md`}
                      style={{ height: `${barHeight}rem` }}
                    >
                      <div
                        className={`w-full bg-black absolute bottom-0 left-0 right-0 ${cappedIrradiation === 6 ? 'rounded-md' : 'rounded-b-md'}`}
                        style={{
                          height: `${fillHeight}rem`,
                          background: color,
                        }}
                      ></div>
                    </div>
                    <p className="uppercase text-xs text-[#596981] text-center pt-1">
                      {dayOfWeek[dayOfWeekNumber]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

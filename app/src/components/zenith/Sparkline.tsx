export function Sparkline({
  data,
  width = 96,
  height = 28,
  positive,
}: {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const pts = data
    .map(
      (v, i) =>
        `${(i * stepX).toFixed(2)},${(
          height -
          ((v - min) / range) * height
        ).toFixed(2)}`,
    )
    .join(" ");

  const isUp = positive ?? data[data.length - 1] >= data[0];
  const stroke = isUp ? "#1fcb7c" : "#f0616d";
  const fill = isUp ? "rgba(31,203,124,0.12)" : "rgba(240,97,109,0.12)";

  return (
    <svg width={width} height={height} className="block shrink-0">
      <polyline
        points={`0,${height} ${pts} ${width},${height}`}
        fill={fill}
        stroke="none"
      />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.25} />
    </svg>
  );
}

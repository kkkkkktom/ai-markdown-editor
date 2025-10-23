// 用 A 表示参数类型数组，R 表示返回值类型
export function debounce<A extends unknown[], R>(
  fn: (...args: A) => R,
  delay = 300
): (...args: A) => void {
  let timer: number | null = null;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
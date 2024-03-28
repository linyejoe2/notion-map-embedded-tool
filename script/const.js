export const courtMap = {
  臺體大體育館: [120.68994397939694, 24.151399541168043],
  天母體育館: [121.53477862481277, 25.116123294033123],
  嘉南藥理大學紹宗體育館: [120.22977964038311, 22.92320241041931],
  新莊體育館: [121.45185875392662, 25.040705688059862],
  高雄巨蛋: [120.30272039612913, 22.669078279436306],
  國體大綜合體育館: [121.38351678782385, 25.034886112999867],
  臺北體育館: [121.5520715962559, 25.05149686883867],
  輔仁大學中美堂: [121.43225056316766, 25.03830606611792],
  輔仁大學體育館: [121.43225056316766, 25.03830606611792],
  鳳山體育館: [120.35448051490432, 22.621098778459036],
  板橋體育館: [121.45664615860846, 25.013431209540467],
  新竹市立體育館: [120.97893018969037, 24.800064999686203],
  國立彰化師範大學體育館: [120.55896624369083, 24.08073273401198],
};

export function getCourtLocation(courtName) {
  return courtMap[courtName] ? courtMap[courtName] : [120.960515, 23.86781];
};
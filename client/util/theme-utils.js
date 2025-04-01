const mantineColorMap = {
  red: '#fa5252',
  pink: '#e64980',
  grape: '#7526e3',
  violet: '#7950f2',
  indigo: '#4c6ef5',
  blue: '#228be6',
  cyan: '#15aabf',
  teal: '#12b886',
  green: '#40c057',
  lime: '#82c91e',
  yellow: '#fab005',
  orange: '#fd7e14',
  dark: '#495057',
};

// Function to get the actual color value from a Mantine color name
export function getMantineColorValue(colorName) {
  return mantineColorMap[colorName] || '#7526e3'; // Default to luminaire purple if color not found
}

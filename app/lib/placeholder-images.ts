
// ito yung placeholder ng Images 
import data from './placeholder-images.json';
// ito naman yung  Placeholder 
export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// ito naman yung placeholder ng Images
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

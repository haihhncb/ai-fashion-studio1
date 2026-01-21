
export enum EditorMode {
  VIRTUAL_TRY_ON = 'VIRTUAL_TRY_ON',
  FACE_SWAP = 'FACE_SWAP',
  REMOVE_TEXT = 'REMOVE_TEXT',
  CAMERA_ANGLE = 'CAMERA_ANGLE'
}

export interface ProcessingState {
  isProcessing: boolean;
  status: string;
  progress: number;
}

export interface ImageResult {
  id: string;
  originalUrl: string;
  processedUrl: string;
  mode: EditorMode;
  timestamp: number;
}

export type CameraAngle = 'FRONT' | 'SIDE' | 'LOW_ANGLE' | 'HIGH_ANGLE' | 'CLOSE_UP' | 'FULL_BODY';

export interface EditorConfig {
  mode: EditorMode;
  baseImage: string | null;
  referenceImage: string | null;
  cameraAngle?: CameraAngle;
}

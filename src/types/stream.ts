export interface MessageData {
  type: string;
  data: string;
}

export interface StreamCallbacks {
  onMessage: (event: MessageData) => void;
  onError: (error: Error) => void;
}

declare module "react-step-progress-bar" {
  import * as React from "react";

  interface ProgressBarProps {
    percent: number;
    children?: React.ReactNode;
    // add other props as needed, using `any` or more specific types if you want
    [key: string]: any;
  }

  export class ProgressBar extends React.Component<ProgressBarProps> {}

  interface StepProps {
    accomplished?: boolean;
    position?: number;
    transition?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export class Step extends React.Component<StepProps> {}

  export default ProgressBar;
}

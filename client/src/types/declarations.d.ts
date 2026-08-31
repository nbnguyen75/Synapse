interface Window {
  webkitAudioContext: typeof AudioContext;
}

// WICG Spec: https://wicg.github.io/ua-client-hints

// oxlint-disable-next-line @typescript-eslint/no-empty-object-type
declare interface Navigator extends NavigatorUA {}
// oxlint-disable-next-line @typescript-eslint/no-empty-object-type
declare interface WorkerNavigator extends NavigatorUA {}

// https://wicg.github.io/ua-client-hints/#navigatorua
declare interface NavigatorUA {
  readonly userAgentData?: NavigatorUAData;
}

// https://wicg.github.io/ua-client-hints/#dictdef-navigatoruabrandversion
interface NavigatorUABrandVersion {
  readonly version: string;
  readonly brand: string;
}

// https://wicg.github.io/ua-client-hints/#dictdef-uadatavalues
interface UADataValues {
  readonly fullVersionList?: NavigatorUABrandVersion[];
  readonly brands?: NavigatorUABrandVersion[];
  readonly platformVersion?: string;
  readonly formFactors?: string[];
  /** @deprecated in favour of fullVersionList */
  readonly uaFullVersion?: string;
  readonly architecture?: string;
  readonly platform?: string;
  readonly mobile?: boolean;
  readonly bitness?: string;
  readonly wow64?: boolean;
  readonly model?: string;
}

// https://wicg.github.io/ua-client-hints/#dictdef-ualowentropyjson
interface UALowEntropyJSON {
  readonly brands: NavigatorUABrandVersion[];
  readonly platform: string;
  readonly mobile: boolean;
}

// https://wicg.github.io/ua-client-hints/#navigatoruadata
interface NavigatorUAData extends UALowEntropyJSON {
  getHighEntropyValues(hints: string[]): Promise<UADataValues>;
  toJSON(): UALowEntropyJSON;
}

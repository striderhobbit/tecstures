import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Configuration, ConfigurationParameters } from '../src/core/openapi';

export function withApiConfiguration(
  configurationParameters: ConfigurationParameters = {}
): Configuration {
  return new Configuration({
    ...configurationParameters,
  });
}

export function provideApi(
  withConfiguration: Configuration = withApiConfiguration()
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: Configuration, useValue: withConfiguration },
  ]);
}

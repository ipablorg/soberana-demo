import type { ComponentType } from 'react';

import type { RailFamily } from '../../lib/rail-catalogue';

import { CoAchFields } from './co-ach-fields';
import { PixFields } from './pix-fields';
import type { RailFieldsProps } from './rail-field';
import { SepaFields } from './sepa-fields';
import { SpeiFields } from './spei-fields';
import { SwiftFields } from './swift-fields';
import { UkFields } from './uk-fields';
import { UsBankFields } from './us-bank-fields';

export { AddressFields, CommonFields, OptionalCommonFields } from './common-fields';
export type { RailFieldsContext, RailFieldsProps } from './rail-field';

/** One small field-set component per rail family. */
export const RAIL_FIELD_COMPONENTS: Record<RailFamily, ComponentType<RailFieldsProps>> = {
  'us-bank': UsBankFields,
  swift: SwiftFields,
  'co-ach': CoAchFields,
  spei: SpeiFields,
  pix: PixFields,
  sepa: SepaFields,
  uk: UkFields,
};

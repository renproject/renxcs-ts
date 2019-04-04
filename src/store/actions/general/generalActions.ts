import { createStandardAction } from "typesafe-actions";

import { Currency } from "@renex/react-components";
import { _captureBackgroundException_, _captureInteractionException_ } from "../../../lib/errors";

export const storeQuoteCurrency = createStandardAction("SORE_QUOTE_CURRENCY")<Currency>();

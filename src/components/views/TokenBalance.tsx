import * as React from "react";

import { Currency } from "@renex/react-components";
import { BigNumber } from "bignumber.js";
import { Token } from "../../lib/util/market";

export class TokenBalance extends React.Component<Props, State> {
    public render = (): JSX.Element => {
        const { token, convertTo, tokenPrices, digits, toReadable, decimals } = this.props;

        let amount = new BigNumber(this.props.amount);

        if (toReadable) {
            amount = amount.div(new BigNumber(10).pow(decimals || 0));
        }

        if (!amount.isFinite()) {
            amount = new BigNumber(0);
        }

        if (!convertTo) {
            return <>{amount.decimalPlaces(digits || 6).toFixed()}</>;
        }

        if (!tokenPrices) {
            return <>-</>;
        }

        const tokenPriceMap = tokenPrices.get(token);
        if (!tokenPriceMap) {
            return <>-</>;
        }

        const price = tokenPriceMap.get(convertTo);
        if (!price) {
            return <i>ERR</i>;
        }

        let defaultDigits;
        switch (convertTo) {
            case Currency.BTC:
            case Currency.ETH:
                defaultDigits = 3; break;
            default:
                defaultDigits = 2;
        }
        defaultDigits = digits === undefined ? defaultDigits : digits;

        amount = amount.multipliedBy(price);

        if (!amount.isFinite()) {
            amount = new BigNumber(0);
        }

        return <>{amount.toFixed(defaultDigits)}</>;
    }
}

interface Props {
    token: Token;
    amount: string | BigNumber;
    convertTo?: Currency;
    digits?: number;

    toReadable?: boolean;
    decimals?: number;

    tokenPrices?: Map<string, Map<Currency, number>> | null;
}

interface State {
}

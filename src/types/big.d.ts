declare module 'big.js' {
  export default Big

  class Big {
    constructor(value: Big.BigSource)
    
    static DP: number
    static RM: 0 | 1 | 2 | 3
    static roundDown: 0
    static roundHalfUp: 1
    static roundHalfEven: 2
    static roundUp: 3

    plus(n: Big.BigSource): Big
    minus(n: Big.BigSource): Big
    times(n: Big.BigSource): Big
    div(n: Big.BigSource): Big
    pow(n: number): Big
    sqrt(): Big
    abs(): Big
    round(dp?: number, rm?: Big.RoundingMode): Big
    
    eq(n: Big.BigSource): boolean
    gt(n: Big.BigSource): boolean
    gte(n: Big.BigSource): boolean
    lt(n: Big.BigSource): boolean
    lte(n: Big.BigSource): boolean
    
    toFixed(dp?: number, rm?: Big.RoundingMode): string
    toString(): string
    toNumber(): number
  }

  namespace Big {
    type BigSource = number | string | Big
    type RoundingMode = 0 | 1 | 2 | 3
  }
}


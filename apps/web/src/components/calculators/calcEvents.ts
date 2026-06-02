// PostHog usage event stub — Phase 8 will wire this to PostHog.
// Call trackCalculatorUsed(name) when a calculator produces a result.

export function trackCalculatorUsed(
  calculatorName: string,
  _params?: Record<string, unknown>
): void {
  // Phase 8: replace with:
  //   posthog.capture("calculator_used", { calculator: calculatorName, ..._params });
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[calc event stub]", calculatorName, _params);
  }
}

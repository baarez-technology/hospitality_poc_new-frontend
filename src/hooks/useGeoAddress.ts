import { useMemo, useCallback, useEffect, useRef } from 'react';
import { Country, State, City } from 'country-state-city';
import type { ICountry, IState, ICity } from 'country-state-city';

export interface GeoAddressOptions {
  countryCode: string;
  stateCode: string;
  cityName: string;
  onStateReset?: () => void;
  onCityReset?: () => void;
}

export function useGeoAddress({
  countryCode,
  stateCode,
  cityName,
  onStateReset,
  onCityReset,
}: GeoAddressOptions) {
  const prevCountryRef = useRef(countryCode);
  const prevStateRef = useRef(stateCode);

  // All countries (memoized once)
  const countries: ICountry[] = useMemo(() => Country.getAllCountries(), []);

  // States for selected country
  const states: IState[] = useMemo(() => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode);
  }, [countryCode]);

  // Cities for selected country + state
  const cities: ICity[] = useMemo(() => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode);
  }, [countryCode, stateCode]);

  // Whether the selected country has states
  const hasStates = states.length > 0;

  // Whether the selected state has cities
  const hasCities = cities.length > 0;

  // Cascading reset: country changed → reset state & city
  useEffect(() => {
    if (prevCountryRef.current && prevCountryRef.current !== countryCode) {
      onStateReset?.();
      onCityReset?.();
    }
    prevCountryRef.current = countryCode;
  }, [countryCode]);

  // Cascading reset: state changed → reset city
  useEffect(() => {
    if (prevStateRef.current && prevStateRef.current !== stateCode) {
      onCityReset?.();
    }
    prevStateRef.current = stateCode;
  }, [stateCode]);

  // Lookup helpers
  const getCountryName = useCallback(
    (code: string) => countries.find((c) => c.isoCode === code)?.name || code,
    [countries]
  );

  const getStateName = useCallback(
    (cCode: string, sCode: string) => {
      const s = State.getStatesOfCountry(cCode).find((st) => st.isoCode === sCode);
      return s?.name || sCode;
    },
    []
  );

  return {
    countries,
    states,
    cities,
    hasStates,
    hasCities,
    getCountryName,
    getStateName,
  };
}

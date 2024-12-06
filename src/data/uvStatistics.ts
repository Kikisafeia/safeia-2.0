interface UVStatistic {
  season: string;
  minUV: number;
  maxUV: number;
  peakHours: {
    start: number;
    end: number;
  };
}

interface CountryUVData {
  country: string;
  latitude: {
    min: number;
    max: number;
  };
  statistics: {
    [key: string]: UVStatistic;
  };
}

export const uvStatistics: CountryUVData[] = [
  {
    country: "Chile",
    latitude: {
      min: -56,
      max: -17
    },
    statistics: {
      "verano": {
        season: "Diciembre - Febrero",
        minUV: 8,
        maxUV: 14,
        peakHours: {
          start: 11,
          end: 16
        }
      },
      "otoño": {
        season: "Marzo - Mayo",
        minUV: 4,
        maxUV: 8,
        peakHours: {
          start: 11,
          end: 15
        }
      },
      "invierno": {
        season: "Junio - Agosto",
        minUV: 2,
        maxUV: 5,
        peakHours: {
          start: 11,
          end: 14
        }
      },
      "primavera": {
        season: "Septiembre - Noviembre",
        minUV: 6,
        maxUV: 11,
        peakHours: {
          start: 11,
          end: 15
        }
      }
    }
  },
  {
    country: "Argentina",
    latitude: {
      min: -55,
      max: -22
    },
    statistics: {
      "verano": {
        season: "Diciembre - Febrero",
        minUV: 7,
        maxUV: 13,
        peakHours: {
          start: 11,
          end: 16
        }
      },
      "otoño": {
        season: "Marzo - Mayo",
        minUV: 3,
        maxUV: 7,
        peakHours: {
          start: 11,
          end: 15
        }
      },
      "invierno": {
        season: "Junio - Agosto",
        minUV: 2,
        maxUV: 4,
        peakHours: {
          start: 11,
          end: 14
        }
      },
      "primavera": {
        season: "Septiembre - Noviembre",
        minUV: 5,
        maxUV: 10,
        peakHours: {
          start: 11,
          end: 15
        }
      }
    }
  },
  {
    country: "Perú",
    latitude: {
      min: -18,
      max: -0
    },
    statistics: {
      "verano": {
        season: "Diciembre - Febrero",
        minUV: 10,
        maxUV: 15,
        peakHours: {
          start: 10,
          end: 16
        }
      },
      "otoño": {
        season: "Marzo - Mayo",
        minUV: 8,
        maxUV: 13,
        peakHours: {
          start: 10,
          end: 15
        }
      },
      "invierno": {
        season: "Junio - Agosto",
        minUV: 6,
        maxUV: 11,
        peakHours: {
          start: 10,
          end: 15
        }
      },
      "primavera": {
        season: "Septiembre - Noviembre",
        minUV: 9,
        maxUV: 14,
        peakHours: {
          start: 10,
          end: 16
        }
      }
    }
  },
  {
    country: "Colombia",
    latitude: {
      min: -4,
      max: 13
    },
    statistics: {
      "verano": {
        season: "Diciembre - Febrero",
        minUV: 9,
        maxUV: 14,
        peakHours: {
          start: 10,
          end: 16
        }
      },
      "otoño": {
        season: "Marzo - Mayo",
        minUV: 8,
        maxUV: 13,
        peakHours: {
          start: 10,
          end: 15
        }
      },
      "invierno": {
        season: "Junio - Agosto",
        minUV: 7,
        maxUV: 12,
        peakHours: {
          start: 10,
          end: 15
        }
      },
      "primavera": {
        season: "Septiembre - Noviembre",
        minUV: 8,
        maxUV: 13,
        peakHours: {
          start: 10,
          end: 16
        }
      }
    }
  }
];

export function getCurrentSeason(date: Date = new Date()): string {
  const month = date.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 12 || month <= 2) return "verano";
  if (month >= 3 && month <= 5) return "otoño";
  if (month >= 6 && month <= 8) return "invierno";
  return "primavera";
}

export function getCountryFromLatitude(latitude: number): string | null {
  const country = uvStatistics.find(
    c => latitude >= c.latitude.min && latitude <= c.latitude.max
  );
  return country ? country.country : null;
}

export function getUVStatistics(country: string, season: string): UVStatistic | null {
  const countryData = uvStatistics.find(c => c.country === country);
  return countryData ? countryData.statistics[season] : null;
}

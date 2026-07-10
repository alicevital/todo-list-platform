from datetime import date

import requests


NAGER_DATE_URL = "https://date.nager.at/api/v4/Holidays"


class HolidayServiceError(Exception):
    pass


def get_holidays(year: int, country_code: str = "BR") -> list[dict]:
    url = f"{NAGER_DATE_URL}/{country_code.upper()}/{year}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as error:
        raise HolidayServiceError(
            "Não foi possível consultar a API de feriados."
        ) from error

    return response.json()


def get_next_holiday(country_code: str = "BR") -> dict | None:
    today = date.today()

    holidays = get_holidays(
        year=today.year,
        country_code=country_code,
    )

    future_holidays = [
        holiday
        for holiday in holidays
        if date.fromisoformat(holiday["date"]) >= today
    ]

    if future_holidays:
        return future_holidays[0]

    next_year_holidays = get_holidays(
        year=today.year + 1,
        country_code=country_code,
    )

    return next_year_holidays[0] if next_year_holidays else None
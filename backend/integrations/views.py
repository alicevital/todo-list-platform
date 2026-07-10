from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import HolidayServiceError, get_next_holiday


class NextHolidayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        country_code = request.query_params.get("country", "BR")

        try:
            holiday = get_next_holiday(country_code)
        except HolidayServiceError as error:
            return Response(
                {"detail": str(error)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if holiday is None:
            return Response(
                {"detail": "Nenhum feriado encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "date": holiday["date"],
                "name": holiday["name"],
                "local_name": holiday.get("localName", holiday["name"]),
                "country_code": holiday["countryCode"],
                "national_holiday": holiday.get("nationalHoliday"),
                "holiday_types": holiday.get("holidayTypes", []),
            }
        )
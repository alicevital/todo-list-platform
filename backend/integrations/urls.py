from django.urls import path

from .views import NextHolidayView


urlpatterns = [
    path(
        "holidays/next/",
        NextHolidayView.as_view(),
        name="next-holiday",
    ),
]
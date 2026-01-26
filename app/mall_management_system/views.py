from django.shortcuts import render,HttpResponse


def index(request):
    return HttpResponse("<h1>This is mall Management System index page</h1>")
from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from django.contrib import auth
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'rpg.views.home', name='home'),
    # url(r'^rpg/', include('rpg.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    # Bind chronicle paths at chronicle prefix
    url(r'^', include('chronicle.urls')),
    url(r'^restframework', include('djangorestframework.urls', namespace='djangorestframework')),
    url(r'^accounts/', include('django.contrib.auth.urls')),
    url(r'^logout/', 'django.contrib.auth.views.logout', {'next_page': '/'}, name="chronicle-logout"),
)

urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
    )

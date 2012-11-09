from django.conf.urls import patterns, include, url
from chronicle import rest # rest framework class-based views
from chronicle.views import models
from djangorestframework.views import ListOrCreateModelView, InstanceModelView
from chronicle.rest import *

urlpatterns = patterns('chronicle.views',
    url(r'^$', 'index', name='chronicle-index'),
    url(r'^(?P<item_type>\w+)/(?P<item_id>\d+)/$', 'item', name='chronicle-item'),
    url(r'^add/(?P<item_type>\w+)/$', 'add_item', name='chronicle-item-add'),
    url(r'^edit/(?P<item_type>\w+)/(?P<item_id>\d+)/$', 'edit_item', name='chronicle-item-edit'),
)

# REST Framework, urls, generate and add
rest_urls = []
import sys
module = sys.modules[__name__]
for string,model in models.iteritems():
    rest_urls.append(url(r'^rest/'+string+'/$', ListOrCreateModelView.as_view(resource=getattr(module, model.__name__ + 'Resource')),name='chronicle-rest-'+string))
    rest_urls.append(url(r'^rest/'+string+'/(?P<pk>\d+)/$', HTMLInstanceModelView.as_view(resource=getattr(module, model.__name__ + 'Resource')),name='chronicle-rest-'+string+'-instance'))

urlpatterns += patterns('', *rest_urls)


from django import template
from django.core.urlresolvers import reverse

register = template.Library()

@register.simple_tag
def rest_url_type(type):
    return reverse('chronicle-rest-'+type)

@register.simple_tag
def rest_url_item(type,id):
    return reverse('chronicle-rest-'+type+'-instance', args=[id])


# -*- coding: utf-8 -*-
from djangorestframework.resources import ModelResource
from djangorestframework.views import InstanceModelView
from chronicle.models import Note
from chronicle.views import models, ModelFormClassFactory
import sys
from django.utils.safestring import mark_safe
from django.db import models as d_models

# List of allowed models
model_list = [
    'Note',
]

# We build a factory because declaring resources is lame ;)
def ResourceFactory(use_model,*args, **kwargs):
    class ResourceClass(ModelResource):
        form = ModelFormClassFactory(use_model)
        model = use_model

        # Defaults really
        exclude = None
        depth = None

        # If the JS adds cruft REST Framework should just ignore it
        allow_unknown_form_fields = True

        # This is a modified copy of the original serialize_val
        # It makes backbone.js compatible with Django REST Framework
        # in how it handles related items (we want ids, not objects)
        def serialize_val(self, key, obj, related_info):
            """
            Convert a model field or dict value into a serializable representation.
            """

            related_serializer = self.get_related_serializer(related_info)

            if self.depth is None:
                depth = None
            elif self.depth <= 0:
                return self.serialize_max_depth(obj)
            else:
                depth = self.depth - 1

            for m in model_list:
                if m == obj.__class__.__name__:
                    obj = obj.id

            if 'ManyRelatedManager' == obj.__class__.__name__:
                objs = []
                for o in obj.all():
                    objs.append(o.id)
                obj = objs


            if any([obj is elem for elem in self.stack]):
                return self.serialize_recursion(obj)
            else:
                stack = self.stack[:]
                stack.append(obj)

            return related_serializer(depth=depth, stack=stack).serialize(obj, request=getattr(self, 'request', None))
    return ResourceClass


module = sys.modules[__name__]

# Generate every resource from the models list
for string, model in models.iteritems():
    setattr(module, model.__name__ + 'Resource', ResourceFactory(model))

# Extend InstanceModelView to make some of our HTML-fields safe to output
# this really should strip some tags and more to be XSS-safe
class HTMLInstanceModelView(InstanceModelView):
# Mark description fields as safe regardless of HTML
    def get(self, request, *args, **kwargs):
        model = self.resource.model
        query_kwargs = self.get_query_kwargs(request, *args, **kwargs)

        try:
            self.model_instance = self.get_instance(**query_kwargs)
            if hasattr(self.model_instance,'text'):
                mark_safe(self.model_instance.text)

        except model.DoesNotExist:
            raise ErrorResponse(status.HTTP_404_NOT_FOUND)

        return self.model_instance


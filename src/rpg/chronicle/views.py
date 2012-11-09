from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from chronicle.models import Note
from itertools import chain
from django.template import RequestContext
from django import forms
from django.forms.models import inlineformset_factory
from django.core.urlresolvers import reverse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models.fields import FieldDoesNotExist
import simplejson as json
import datetime

# Form Classes
def ModelFormFactory(use_model, *args, **kwargs):
    """Create a generic modelform."""

    class GenericModelForm(forms.ModelForm):
        class Meta:
            model = use_model

    return GenericModelForm(*args, **kwargs)

def ModelFormClassFactory(use_model, *args, **kwargs):
    """Create a generic model form class."""

    class GenericModelForm(forms.ModelForm):
        class Meta:
            model = use_model

    return GenericModelForm

# Views
@login_required
def index(request):
    """A dashboard of all your recent content."""

    notes = Note.objects.all()

    return render_to_response('chronicle/index.html', {'notes': notes}, context_instance=RequestContext(request))

@login_required
def item(request, item_type, item_id):

    item = get_object_or_404(item_type_to_model(item_type), id=item_id)

    return render_to_response('chronicle/item.html', {'item': item}, context_instance=RequestContext(request))

@login_required
def add_item(request, item_type):

    model = item_type_to_model(item_type)
    if request.method == 'POST':
        form = ModelFormFactory(model,request.POST, request.FILES)
        next_page= request.POST.get('next','')
        if form.is_valid():
            item = form.save()
            if next_page!= '':
                return HttpResponseRedirect(next_page)
            else:
                return HttpResponseRedirect(reverse('chronicle-item-edit', args=[item_type, item.id]))
    else:
        next_page= request.GET.get('next','')
        form = ModelFormFactory(model)

    return render_to_response('chronicle/item-form.html', {'form': form, 'item_type': item_type, 'next': next_page}, context_instance=RequestContext(request))

@login_required
def edit_item(request, item_type, item_id):

    model = item_type_to_model(item_type)
    if request.method == 'POST':
        form = ModelFormFactory(model,request.POST,request.FILES,instance=model.objects.get(id=item_id))
        next_page= request.POST.get('next','')
        if form.is_valid():
            form.save()

            if next_page!= '':
                return HttpResponseRedirect(next_page)
            else:
                return HttpResponseRedirect(reverse('chronicle-item-edit', args=[item_type,item_id]))
    else:
        next_page= request.GET.get('next','')
        form = ModelFormFactory(model,instance=model.objects.get(id=item_id))

        return render_to_response('chronicle/item-form.html', {'form': form,
            'item_type': item_type, 'item_id': item_id, 'next': next_page}, context_instance=RequestContext(request))

# Match string name to type, limits potentially internal types as well
def item_type_to_model(item_type):
    model = {
            'note': lambda: Note,
    }[item_type]()

    return model

models = {
    'note': Note,
}


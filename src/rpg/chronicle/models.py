from django.db import models

class Note(models.Model):
    """Our note object."""
    title = models.CharField(max_length=128, unique=True)
    text = models.TextField(blank=True, null=True)

    def __unicode__(self):
        return self.title

    class Meta:
        ordering = ('title',)


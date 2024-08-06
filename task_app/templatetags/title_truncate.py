from django import template

register = template.Library()

@register.filter
def title_if_long(value, max_length=19):
    if len(value) > max_length:
        return value[:19] + "..."
    return value
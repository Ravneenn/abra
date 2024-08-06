from django import template

register = template.Library()

@register.filter
def truncate_if_long(value, max_length=250):
    if len(value) > max_length:
        return value[:250] + "..."
    return value
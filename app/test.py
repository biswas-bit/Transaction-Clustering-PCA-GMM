from .models import Transaction

all_data = Transaction.objects.all()
print(all_data)
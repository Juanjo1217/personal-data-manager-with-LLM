# Generated by Django 5.2.1 on 2025-05-27 19:50

import usuarios.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='celular',
            field=models.CharField(blank=True, max_length=10, validators=[usuarios.validators.validar_solo_numeros]),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='fecha_nacimiento',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='genero',
            field=models.CharField(blank=True, choices=[('M', 'Masculino'), ('F', 'Femenino'), ('NB', 'No binario'), ('NR', 'Prefiero no reportar')], max_length=2),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='numero_documento',
            field=models.CharField(blank=True, max_length=10, null=True, unique=True, validators=[usuarios.validators.validar_solo_numeros]),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='tipo_documento',
            field=models.CharField(blank=True, choices=[('TI', 'Tarjeta de identidad'), ('CC', 'Cédula')], max_length=2),
        ),
    ]

from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in obour_ticketing/__init__.py
from obour_ticketing import __version__ as version

setup(
	name="obour_ticketing",
	version=version,
	description="Ticketing stuff",
	author="ARD",
	author_email="o.shehada@ard.ly",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)

# Theatre DB

## Description

For a long time, I've wanted to create a website that aggregates the most up-to-date theatre production information in one place. It would be like Fandango + IMDB except for local theatre. I've had many false starts. This is another step in the journey.

## Predecessor

I had some luck creating a proof of concept last weekend. I used Docker to pull down an image of MongoDB which I ran locally. I used Mongoose and Typescript. I had the search results for licenses issued by Dramatist's Play Service for productions in the state of Washington up. The eventual setup I came up with allowed me to copy and paste list entries and sections for the detail pages about the scripts into template string sections. Then I would compile and run the tool and it would parse the data into JSON objects which I would visually inspect for correctness. When I was satisfied, I would submit them to the MongoDB. Using this method I was about to enter 40 productions, including information about the producing organization, the script, reviews and awards the script has recieved, and the author(s). Furthermore, the system I created would perform an upsert operation for each record type, so duplicates would automatically be merged as I went along.

I counted this a success because it allowed me to enjoy the process of data entry. While entering the data, I was also able to read about these plays which I have a opportunity to see if I want, because they are all upcoming and they are all in my area. I think this should be a key goal of this project. Data gathering should be a form of personal research which is kind of fun, even for it's own sake.

The only thing that really stopped me from moving forward with what I had is that I wanted to be able to show it to people and I couldn't.

## Design

- A "record" is what mongo calls a "document." Examples of records in the first implementation: organizations, productions, scripts, and people.
- A record contains the logic for identifying whether that record is already in the database. For example, most things will have a fairly unique name. However, if multiple records exist with the same name, other identifiers may be used. For example, two scripts may have the same name, but will never have the same set of authors. Thus, for scripts, name + authors gives a method of unique identification that has real-world meaning. The goal is for duplicates to be automatically found and merged whenever present. Each record type identifies a set of fields used for identification. This is will also become the subset of the record that shows up within linked records and is the minimum required fields to create a new record.
- All create and update operations are actually "upsert" operations. That is, a record is merged with any existing record that is a unique match. For this iteration of the project, we will assume that the identification criteria is sufficiently detailed that this is a valid simplification to make.
- Records may link to other records. When this happens, both records will contain entries within them that have both the id of the other, and sufficient real world identifiers to identify the other without using the id. These are two way links between records. In a one-to-many, or many-to-many relationship, the record may have an array of entries. For example, an author will have a list of works they have contributed to, and a script may have multiple authors.
- Records can upsert the minimum info required to create a linked record that does not already exist. For example, inserting a script may also result in an author or two being created.
- Records contain a schema that describes in detail what data is contained in the record. This schema must be able to evolve and it must be able to do so in ways that break backwards compatability. For example, in the first iteration of the project, I discovered that scripts needed to have an authors array, not an author field. This was a breaking change and, given the small data set, I simply started over rather than work out how to do the data migration. Records must have a straightforward way to do a data migration between non-backwards compatable versions of their schemas.

## Plan

- I've decided to use the MongoDB Altas Cloud service for eventual deployment. Thus, I am going to switch from using the Mongoose javascript library for interacting with mongo to using the Stitch SDK provided by the Atlas Cloud service. It looks like it has better typescript support.
- Step one is to replicate what I built in the first draft using the new stack, and the slightly more robust design. There will be a couple minor-ish tweaks. Instead of copying and pasting into string templates in the project source, I'll make a rudimentary UI for that. It will streamline the process of generating the parsed json to review and submitting it to the database. I will also build tests as I go.
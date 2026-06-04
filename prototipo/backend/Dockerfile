FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["StudyLink.Backend.csproj", "./"]
RUN dotnet restore "./StudyLink.Backend.csproj"
COPY . .
RUN dotnet publish "StudyLink.Backend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "StudyLink.Backend.dll"]

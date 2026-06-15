FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["StudyLink.Api/StudyLink.Api.csproj", "StudyLink.Api/"]
RUN dotnet restore "StudyLink.Api/StudyLink.Api.csproj"

COPY . .
WORKDIR "/src/StudyLink.Api"
RUN dotnet build "StudyLink.Api.csproj" -c Release -o /app/build
RUN dotnet publish "StudyLink.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "StudyLink.Api.dll"]
